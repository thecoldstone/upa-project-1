// Remove all nodes and relationships
MATCH (n)
DETACH DELETE n;

// Load CSV data
LOAD CSV WITH HEADERS FROM "https://data.brno.cz/datasets/mestobrno::brno-brzo-stavební-projekty-a-záměry-brno-brzo-development-projects-and-plans.csv" AS row
MERGE (p:Project {id: row.globalid}) ON CREATE SET  
        p.name                  = row.nazev_projektu,
        p.address               = row.adresa,
        p.district              = row.mestska_cast,
        p.description           = row.poznamky
MERGE (d:Developer {name: COALESCE(row.developer_investor, "Neuvedeno")})
MERGE (a:Architect {name: COALESCE(row.architekt, "Neuvedeno")})
FOREACH (_ in CASE row.stav WHEN "planovany" THEN [1] ELSE [] END |
        MERGE (p)-[:PLANNED]->(a)
)
FOREACH (_ in CASE row.stav WHEN "v realizaci" THEN [1] ELSE [] END |
        MERGE (p)-[:IN_PROGRESS]->(a)
)
FOREACH (_ in CASE row.stav WHEN "dokonceny" THEN [1] ELSE [] END |
        MERGE (p)-[:COMPLETED]->(a)
)
FOREACH (_ in CASE row.typ_investice WHEN "soukroma" THEN [1] ELSE [] END |
        MERGE (d)-[:INVESTED_PRIVATLY]->(p)
)
FOREACH (_ in CASE row.typ_investice WHEN "verejna" THEN [1] ELSE [] END |
        MERGE (d)-[:INVESTED_PUBLICLY]->(p)
)
FOREACH (_ in CASE row.typ_investice WHEN "Strategicky_projekt_mesta_Brna" THEN [1] ELSE [] END |
        MERGE (d)-[:INVESTED_STRATEGICALLY]->(p)
)

MERGE (p)-[:DEVELOPED_BY]->(d)
MERGE (p)-[:ARCHITECTED_BY]->(a)
MERGE (d)-[:WORKED_WITH]->(a);

// Query architects and developers with common projects 
match q=(a:Architect)<--(project)<-[:DEVELOPED_BY]-(developer) return q limit 25;