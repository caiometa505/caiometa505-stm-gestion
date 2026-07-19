import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  AlertCircle,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Bell,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useStore } from '@/hooks/use-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Layout() {
  const { signOut, user } = useAuth()
  const { stores, selectedStoreId, setSelectedStoreId } = useStore()
  const location = useLocation()

  const navItems = [
    { title: 'Escritorio', path: '/', icon: LayoutDashboard },
    { title: 'Recepción', path: '/reception', icon: Package },
    { title: 'Garantías', path: '/warranties', icon: ShieldCheck },
    { title: 'Reclamaciones', path: '/claims', icon: AlertCircle },
    { title: 'Configuración', path: '/settings', icon: SettingsIcon },
  ]

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <Package className="h-6 w-6 text-blue-600" />
            <span>STM Gestión</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="mt-4 px-2 space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.path}
                  tooltip={item.title}
                >
                  <Link to={item.path}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm sticky top-0 z-10">
          <SidebarTrigger />

          <div className="hidden sm:block">
            <Select value={selectedStoreId || ''} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-[200px] border-none bg-slate-100 shadow-none">
                <SelectValue placeholder="Seleccionar tienda" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${store.status === 'Operativa' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      {store.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar ID..."
                className="w-full bg-slate-100 border-none pl-8 shadow-none rounded-full"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user?.avatar ||
                        `https://img.usecurling.com/ppl/thumbnail?seed=${user?.id || 1}`
                      }
                      alt="Avatar"
                    />
                    <AvatarFallback>{user?.name?.substring(0, 2) || 'AD'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || 'Administrador'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
