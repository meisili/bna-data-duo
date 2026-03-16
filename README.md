# Chemicals in Cosmetics

__Live project URL:__ https://chemistry-of-beauty.netlify.app/

We relied on the database content and reportable ingredients list from the California Department of Public Health's [California Safe Cosmetic Program Product Database](https://cscpsearch.cdph.ca.gov/search/publicsearch). 

__Understanding the Data__

The database is a total record of all ingredients submitted to the California Department of Public Health since 2009 and is continuously updated. Companies only report the ingredients in their products once, and are not required to report their ingredients each year, unless they discontinue their product or change its formula. 

When downloading data from the database, including the following fields: UPC, Body Application Areas, Product Categories, Product Forms, and/or Intended Markets, may result in duplicates, as one cosmetic product may fit into multiple categories. 

__Methodology__

To build our dataset, we downloaded the CDPH database content as a csv to have a complete list of all reported ingredients. The ingredient names are not clean or readable. To obtain a clean ingredient name, we needed to find each ingredient's CAS registry number - a unique, universal code assigned to chemical substances, and then determine its associated official name. 

To do so, we queried the [CAS Common Chemistry API](https://commonchemistry.cas.org/api-overview). First, we had to clean some of the names. Then, we queried the API off of the ingredient name to pull both CAS number and ingredient name (api calls notebook & unique ingredient api call notebooks). We conducted two API calls - one off of the entire dataframe, which was a very lengthy process, and the second was off of the approximate 500 unique ingredients. Neither API call was completely successful and manual searches of the ingredient names were required afterwards. If replicating data cleaning and analysis, use the unique ingredient api call method as it will drastically reduce processing time. 

Once each unique ingredient had a clean name and CAS number, we merged our ingredient dataframe with the Reportable Ingredient List off of the CAS number column to identify the hazard traits associated with each ingredient. Several values returned NA values and required manual review. Finally, we merged the ingredient & harms dataframe with the original CDPH dataframe (merging and cleaning data notebook). Note that some ingredients have multiple types of harms. If an ingredient has multiple harms, the values are listed in the same column, separated by semicolons. In order to conduct analysis, the column will need to be "exploded" into additional rows. When conducting analysis, ensure data is properly deduplicated depending on the columns used and qualify the analysis if deduplication is not possible. 


## Building the Searchable Database

The database allows users to search across thousands of cosmetic product records by company, brand, product name, ingredient, hazard traits, and more.

### 1. Data Source & Preparation

Raw data was obtained as a CSV file. Because Supabase has a 50MB file upload limit, the CSV was split into three equal parts using a PowerShell script, each retaining the original header row.

### 2. Hosting on Supabase

We used [Supabase](https://supabase.com) — a free cloud PostgreSQL database — to host the data. After creating a project, the three CSV parts were uploaded sequentially into a single table called `master-table`. Row Level Security (RLS) was enabled on the table, with a public read policy to allow anyone to query the data.

### 3. Search Setup (SQL)

To enable fast, partial, case-insensitive search across all columns, we used PostgreSQL's `pg_trgm` extension and created a trigram index on a concatenation of all searchable columns. We then created a stored SQL function `search_master_table(search_term text)` that runs an `ILIKE` query against this index — making searches like "loreal" match "L'Oreal" regardless of case or partial spelling.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_master_trgm ON "master-table"
USING gin((
    coalesce("Company", '') || ' ' || coalesce("Brand", '') || ' ' ||
    coalesce("Product Name", '') || ' ' || coalesce("Ingredient Name", '') || ' ' ||
    coalesce("Hazard Traits", '')
) gin_trgm_ops);

CREATE OR REPLACE FUNCTION search_master_table(search_term text)
RETURNS SETOF "master-table" LANGUAGE sql AS $$
  SELECT * FROM "master-table"
  WHERE (
      coalesce("Company", '') || ' ' || coalesce("Brand", '') || ' ' ||
      coalesce("Product Name", '') || ' ' || coalesce("Ingredient Name", '') || ' ' ||
      coalesce("Hazard Traits", '')
  ) ILIKE '%' || search_term || '%';
$$;

GRANT EXECUTE ON FUNCTION search_master_table(text) TO anon;
```

### 4. Connecting to the Website

The frontend connects to Supabase via its REST API using a public anonymous key. Supabase credentials are stored in a local `config.js` file (excluded from the repository via `.gitignore`). A `config.example.js` template is included for reference.

When a user types a search term, `js/database.js` sends a `POST` request to the `search_master_table` RPC endpoint. Results are returned as JSON and rendered in a paginated table (50 rows per page). When no search term is entered, the full table is loaded with standard pagination.

## License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.