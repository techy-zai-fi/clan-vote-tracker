-- Enable UPDATE on clans table for public (admin interface)
CREATE POLICY "Allow public update clans"
ON clans
FOR UPDATE
USING (true);