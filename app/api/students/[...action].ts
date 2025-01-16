import { NextApiRequest, NextApiResponse } from 'next';

import { createClient } from '@/libs/supabase/client';

const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { action } = req.query;

  switch (method) {
    case 'GET':
      if (action[0] === 'getStudent') {
        return await getStudent(req, res);
      }
      return res.status(400).json({ message: 'Invalid action' });
    case 'PUT':
      if (action[0] === 'updateStudent') {
        return await updateStudent(req, res);
      }
      return res.status(400).json({ message: 'Invalid action' });
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const getStudent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query;

  // Validate input
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(404).json({ message: 'Student not found' });

  return res.status(200).json(data);
};

const updateStudent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, studentData } = req.body;

  // Validate input
  if (!userId || !studentData) {
    return res.status(400).json({ message: 'User ID and student data are required' });
  }

  const { error } = await supabase
    .from('students')
    .update(studentData)
    .eq('id', userId);

  if (error) return res.status(500).json({ message: error.message });

  return res.status(200).json({ message: 'Student information updated successfully' });
}; 