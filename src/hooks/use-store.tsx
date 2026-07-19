import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

interface Store {
  id: string
  name: string
  status: string
}

interface StoreContextType {
  selectedStoreId: string | null
  setSelectedStoreId: (id: string) => void
  stores: Store[]
  loading: boolean
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within a StoreProvider')
  return context
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const records = await pb.collection('stores').getFullList({ sort: 'name' })
        setStores(records as unknown as Store[])
        if (records.length > 0 && !selectedStoreId) {
          setSelectedStoreId(records[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (pb.authStore.isValid) {
      fetchStores()
    } else {
      setLoading(false)
    }
  }, [selectedStoreId])

  return (
    <StoreContext.Provider value={{ selectedStoreId, setSelectedStoreId, stores, loading }}>
      {children}
    </StoreContext.Provider>
  )
}
