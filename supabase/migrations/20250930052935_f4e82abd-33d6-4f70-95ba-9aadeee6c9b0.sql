-- Update clan IDs and reseed with new values
DELETE FROM clans;

-- Insert clans with new IDs
INSERT INTO clans (id, name, quote, display_order) VALUES
('MM', 'Mahanadi', 'Flow and Adaptability', 1),
('SS', 'Shivalik', 'Strength and Resilience', 2),
('WW', 'Windward', 'Vision and Freedom', 3),
('YY', 'Yamuna', 'Purity and Grace', 4),
('AA', 'Aravali', 'Endurance and Stability', 5),
('NN', 'Nilgiri', 'Heights and Aspiration', 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  quote = EXCLUDED.quote,
  display_order = EXCLUDED.display_order;