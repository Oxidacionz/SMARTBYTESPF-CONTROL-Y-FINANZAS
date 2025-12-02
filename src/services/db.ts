
import { supabase } from '../supabaseClient';
import { FinancialItem, PhysicalAsset, SpecialEvent, ShoppingItem, ExchangeRates, DirectoryEntity } from '../types';

// Helper de seguridad: Obtener usuario autenticado o fallar
const getAuthenticatedUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
        throw new Error("Violación de seguridad: Intento de acceso sin sesión válida.");
    }
    return session.user;
};

// --- Directory (New) ---
export const dbDirectory = {
  getAll: async (): Promise<DirectoryEntity[]> => {
    const user = await getAuthenticatedUser();
    const { data, error } = await supabase.from('directory_entities').select('*').eq('user_id', user.id).order('name');
    if (error) throw error;
    return data || [];
  },
  add: async (entity: DirectoryEntity) => {
    const user = await getAuthenticatedUser();
    const safeEntity = { ...entity, user_id: user.id };
    const { data, error } = await supabase.from('directory_entities').insert(safeEntity).select().single();
    if (error) throw error;
    return data; // Returns the created entity with ID
  },
  update: async (entity: DirectoryEntity) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase.from('directory_entities').update(entity).eq('id', entity.id).eq('user_id', user.id);
    if (error) throw error;
  },
  delete: async (id: string) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase.from('directory_entities').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  }
};

// --- Financial Items ---
export const dbItems = {
  getAll: async (): Promise<FinancialItem[]> => {
    const user = await getAuthenticatedUser();
    const { data, error } = await supabase
        .from('financialItems')
        .select('*')
        .eq('user_id', user.id); 
    
    if (error) throw error;
    return data || [];
  },
  add: async (item: FinancialItem) => {
    const user = await getAuthenticatedUser();
    const safeItem = { ...item, user_id: user.id };
    const { error } = await supabase.from('financialItems').insert(safeItem);
    if (error) throw error;
  },
  addBulk: async (items: FinancialItem[]) => {
      const user = await getAuthenticatedUser();
      const safeItems = items.map(i => ({ ...i, user_id: user.id }));
      const { error } = await supabase.from('financialItems').insert(safeItems);
      if (error) {
        console.error("Supabase Bulk Insert Error:", error.message, error.details);
        throw error;
      }
  },
  update: async (item: FinancialItem) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase
        .from('financialItems')
        .update(item)
        .eq('id', item.id)
        .eq('user_id', user.id);
    if (error) throw error;
  },
  delete: async (id: string) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase
        .from('financialItems')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    if (error) throw error;
  }
};

// --- Physical Assets ---
export const dbAssets = {
  getAll: async (): Promise<PhysicalAsset[]> => {
    const user = await getAuthenticatedUser();
    const { data, error } = await supabase.from('physicalAssets').select('*').eq('user_id', user.id);
    if (error) throw error;
    return data || [];
  },
  add: async (item: PhysicalAsset) => {
    const user = await getAuthenticatedUser();
    const safeItem = { ...item, user_id: user.id };
    const { error } = await supabase.from('physicalAssets').insert(safeItem);
    if (error) throw error;
  },
  update: async (item: PhysicalAsset) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase.from('physicalAssets').update(item).eq('id', item.id).eq('user_id', user.id);
    if (error) throw error;
  },
  delete: async (id: string) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase.from('physicalAssets').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  }
};

// --- Events ---
export const dbEvents = {
  getAll: async (): Promise<SpecialEvent[]> => {
    const user = await getAuthenticatedUser();
    const { data, error } = await supabase.from('specialEvents').select('*').eq('user_id', user.id);
    if (error) throw error;
    return data || [];
  },
  add: async (item: SpecialEvent) => {
    const user = await getAuthenticatedUser();
    const safeItem = { ...item, user_id: user.id };
    const { error } = await supabase.from('specialEvents').insert(safeItem);
    if (error) throw error;
  },
  update: async (item: SpecialEvent) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase.from('specialEvents').update(item).eq('id', item.id).eq('user_id', user.id);
    if (error) throw error;
  },
  delete: async (id: string) => {
    const user = await getAuthenticatedUser();
    const { error } = await supabase.from('specialEvents').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  }
};

// --- Shopping History ---
export const dbShopping = {
  getAll: async (): Promise<ShoppingItem[]> => {
    const user = await getAuthenticatedUser();
    const { data, error } = await supabase
        .from('shoppingHistory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  add: async (item: ShoppingItem) => {
    const user = await getAuthenticatedUser();
    const safeItem = { ...item, user_id: user.id };
    const { error } = await supabase.from('shoppingHistory').insert(safeItem);
    if (error) throw error;
  }
};

// --- Exchange Rates (Shared Resource) ---
export const dbRates = {
  get: async (): Promise<ExchangeRates | null> => {
    const { data, error } = await supabase.from('exchangeRates').select('*').eq('id', 1).single();
    if (error) return null;
    return data;
  },
  update: async (rates: ExchangeRates) => {
    try {
        await getAuthenticatedUser(); 
        const { error } = await supabase.from('exchangeRates').upsert({ ...rates, id: 1 });
        if (error) throw error;
    } catch (e) {
        console.warn("No tienes permisos para actualizar la tasa global o no estás logueado.");
        throw e;
    }
  }
};
