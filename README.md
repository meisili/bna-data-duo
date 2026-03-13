# chemical-cosmetics-test

Live project URL:

We relied on the database content and reportable ingredients list from the California Department of Public Health's [California Safe Cosmetic Program Product Database](https://cscpsearch.cdph.ca.gov/search/publicsearch). 

__Understanding the Data__

The database is a total record of all ingredients submitted to the California Department of Public Health since 2009 and is continuously updated. Companies only report the ingredients in their products once, and are not required to report their ingredients each year, unless they discontinue their product or change its formula. 

When downloading data from the database, including the following fields: UPC, Body Application Areas, Product Categories, Product Forms, and/or Intended Markets, may result in duplicates, as one cosmetic product may fit into multiple categories. 

__Methodology__

To build our dataset, we downloaded the CDPH database content as a csv to have a complete list of all reported ingredients. The ingredient names are not clean or readable. To obtain a clean ingredient name, we needed to find each ingredient's CAS registry number - a unique, universal code assigned to chemical substances, and then determine its associated official name. 

To do so, we queried the [CAS Common Chemistry API](https://commonchemistry.cas.org/api-overview). First, we had to clean some of the names. Then, we queried the API off of the ingredient name to pull both CAS number and ingredient name. The API call was not completely successful and manual searches of the names were required afterwards. 

Once each unique ingredient had a clean name and CAS number, we merged our ingredient dataframe with the Reportable Ingredient List off of the CAS number column to identify the hazard traits associated with each ingredient. Several values returned NA values and required manual review. Finally, we merged the ingredient & harms dataframe with the original CDPH dataframe. 


