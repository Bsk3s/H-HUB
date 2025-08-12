import { supabase } from '../../src/auth/supabase-client';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const getFolders = async () => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw new Error('Could not fetch folders. Please check your connection and try again.');
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
    // Also deletes all notes in the folder due to CASCADE constraint in DB
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
    
    // Gracefully handle the case where a note is not found, which can happen in race conditions.
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

const notesService = {
  getFolders,
  createFolder,
  deleteFolder,
  getNotesByFolder,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
};

export default notesService; 