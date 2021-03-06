Introduction
========
Perseus combines intuitive and easy to use Web-based UI for design and  implement ETL (extract, transform, and load) configuration and service for conversion the native/raw data to the OMOP Common Data Model (CDM).

Additionally Perseus has embedded tools for search in the standardized vocabularies, generates documentation for the ETL process, create the code mappings and data quality check.

Features
========
- Map source data to tables and columns to CDM
- Combine source tables
- Use pre-built sql functions (replace, concat…)
- Use pre-built source to source and source to standard vocabulary lookups (icd9, icd10, ndc…)
- Create custom lookups for the concept_id fields
- Set constant values to the CDM fields
- Use System/Auto generated values for the CDM fields
- Auto mapping for similar fields
- OMOP Vocabulary search
- Data Quality check
- Search mapping between new codes and OMOP standard concepts
- Convert data from native format to CDM
- Logic for creating eras (DRUG_ERAs, CONDITION_ERAs…)
- Logic for grouping visit occurrence/observation_period records
- Auto domain switching 
- Create ETL specification

Screenshots
===========
<img src="https://github.com/SoftwareCountry/CDMSouffleur/blob/master/images/start.PNG" alt="Start page" title="Start page" />
<img src="https://github.com/SoftwareCountry/CDMSouffleur/blob/master/images/link_tables2.PNG" alt="Link tables" title="Link tables" />
<img src="https://github.com/SoftwareCountry/CDMSouffleur/blob/master/images/link_fields.PNG" alt="Link fields" title="Link fields" />
<img src="https://github.com/SoftwareCountry/CDMSouffleur/blob/master/images/concept.PNG" alt="Concept configuration" title="Concept configuration" />
<img src="https://github.com/SoftwareCountry/CDMSouffleur/blob/master/images/lookup.PNG" alt="Lookup configuration" title="Lookup configuration" />

Technology
============
- Angular 9
- Python 3.6
- Java 15
- R 4.0.4
- PostgreSQL 13.2
- .NET Core 3.1

Deployment server requirements
===============

 - Unix OS (Ubuntu), Docker,
 - 4GB RAM, 100 GB HDD,
 - Sudo user,
 - Open ports: 443, 80, 8001.

Getting Started
===============

### Database

Get link to the vocabulary from [Athena](http://athena.ohdsi.org).

    cd database

Open load_csv.sh

Replace the vocabulary link with your own

    cd database
    docker build -t perseus-database .
    docker run --name perseus-database -d -p 5431:5432 perseus-database

### Back-end

    docker build -t perseus-backend .
    docker run -e CDM_SOUFFLEUR_ENV='default' --name perseus-backend -d --network host perseus-backend

### Front-end
    
    cd UI
    docker build -t perseus-frontend .
    docker run --name perseus-frontend -d --network host perseus-frontend

Perseus uses auxiliary services to scan, convert and validate data. 

Below are links to these services, which should be included in the app build. 

### White-rabbit service

https://github.com/SoftwareCountry/WhiteRabbit

### Cdm-builder service

https://github.com/SoftwareCountry/ETL-CDMBuilder

### Data-quality-check service

https://github.com/SoftwareCountry/DataQualityDashboard

### Getting Involved

* User guide and Help: [Perseus documentation](https://github.com/SoftwareCountry/Perseus/wiki)
* We use the [GitHub issue tracker](https://github.com/SoftwareCountry/Perseus/issues) 


License
=======
Perseus is licensed under Apache License 2.0
