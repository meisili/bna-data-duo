# Chemicals in Cosmetics

__Live project URL:__

We relied on the database content and reportable ingredients list from the California Department of Public Health's [California Safe Cosmetic Program Product Database](https://cscpsearch.cdph.ca.gov/search/publicsearch). 

__Understanding the Data__

The database is a total record of all ingredients submitted to the California Department of Public Health since 2009 and is continuously updated. Companies only report the ingredients in their products once, and are not required to report their ingredients each year, unless they discontinue their product or change its formula. 

When downloading data from the database, including the following fields: UPC, Body Application Areas, Product Categories, Product Forms, and/or Intended Markets, may result in duplicates, as one cosmetic product may fit into multiple categories. 

__Methodology__

To build our dataset, we downloaded the CDPH database content as a csv to have a complete list of all reported ingredients. The ingredient names are not clean or readable. To obtain a clean ingredient name, we needed to find each ingredient's CAS registry number - a unique, universal code assigned to chemical substances, and then determine its associated official name. 

To do so, we queried the [CAS Common Chemistry API](https://commonchemistry.cas.org/api-overview). First, we had to clean some of the names. Then, we queried the API off of the ingredient name to pull both CAS number and ingredient name (api calls notebook & unique ingredient api call notebooks). We conducted two API calls - one off of the entire dataframe, which was a very lengthy process, and the second was off of the approximate 500 unique ingredients. Neither API call was completely successful and manual searches of the ingredient names were required afterwards. If replicating data cleaning and analysis, use the unique ingredient api call method as it will drastically reduce processing time. 

Once each unique ingredient had a clean name and CAS number, we merged our ingredient dataframe with the Reportable Ingredient List off of the CAS number column to identify the hazard traits associated with each ingredient. Several values returned NA values and required manual review. Finally, we merged the ingredient & harms dataframe with the original CDPH dataframe (merging and cleaning data notebook). Note that some ingredients have multiple types of harms. If an ingredient has multiple harms, the values are listed in the same column, separated by semicolons. In order to conduct analysis, the column will need to be "exploded" into additional rows. When conducting analysis, ensure data is properly deduplicated depending on the columns used and qualify the analysis if deduplication is not possible. 


