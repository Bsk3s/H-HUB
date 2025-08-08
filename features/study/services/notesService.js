import { supabase } from '../../../src/auth/supabase-client';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Demo mode: Use a fixed demo user ID if no user is authenticated
  if (!user) {
    console.log('📝 Study Demo Mode: Using demo user ID');
    return 'demo-user-study-notes'; // Fixed demo user ID
  }
  
  return user.id;
};

export const getFolders = async () => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw new Error('Could not fetch folders. Please try again.');
  }
};

export const createFolder = async (name) => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('folders')
      .insert({ name, user_id: userId })
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Could not create the folder. Please try again.');
  }
};

export const deleteFolder = async (folderId) => {
  try {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw new Error('Could not delete the folder. Please try again.');
  }
};

export const getNotesByFolder = async (folderId) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('folder_id', folderId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw new Error('Could not fetch notes. Please try again.');
  }
};

export const createNote = async (folderId, noteData) => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('notes')
      .insert({ ...noteData, folder_id: folderId, user_id: userId })
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating note:', error);
    throw new Error('Could not create the note. Please try again.');
  }
};

export const getNoteById = async (noteId) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();
    
    // Gracefully handle the case where a note is not found
    if (error && error.code === 'PGRST116') {
      console.warn(`Note with ID ${noteId} not found. It may have been deleted or not yet saved.`);
      return null; 
    }
    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    throw new Error('Could not fetch the note. Please try again.');
  }
};

export const updateNote = async (noteId, noteData) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...noteData, updated_at: new Date() })
      .eq('id', noteId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Could not update the note. Please try again.');
  }
};

export const deleteNote = async (noteId) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Could not delete the note. Please try again.');
  }
};
