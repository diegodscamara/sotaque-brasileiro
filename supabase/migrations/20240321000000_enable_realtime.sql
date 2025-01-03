-- Enable realtime for classes table
ALTER TABLE classes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE classes; 