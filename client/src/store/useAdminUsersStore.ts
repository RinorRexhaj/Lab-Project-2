import { create } from 'zustand';
import { User, UserFilter } from '../types/User';

interface AdminUsersState {
  users: User[];
  totalUsers: number;
  currentPage: number;
  itemsPerPage: number;
  loading: boolean;
  selectedUser: User | null;
  filter: UserFilter;
  
  setUsers: (users: User[]) => void;
  setTotalUsers: (total: number) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setLoading: (loading: boolean) => void;
  setSelectedUser: (user: User | null) => void;
  setFilter: (filter: Partial<UserFilter>) => void;
  resetFilters: () => void;
}

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  users: [],
  totalUsers: 0,
  currentPage: 1,
  itemsPerPage: 10,
  loading: false,
  selectedUser: null,
  filter: {
    search: '',
    role: '',
    status: ''
  },
  
  setUsers: (users) => set({ users }),
  setTotalUsers: (totalUsers) => set({ totalUsers }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),
  setLoading: (loading) => set({ loading }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setFilter: (filter) => set((state) => ({ 
    filter: { ...state.filter, ...filter } 
  })),
  resetFilters: () => set({ 
    filter: { search: '', role: '', status: '' },
    currentPage: 1
  })
}));
