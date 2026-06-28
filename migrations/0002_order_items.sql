-- Store the line-item breakdown for cart orders (multi-ticket purchases).
ALTER TABLE purchases ADD COLUMN items_json TEXT;
