'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/table'
import { Modal, ModalFooter } from '@/components/admin/modal'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/admin/stat-card'
import { Search, AlertTriangle, Package, RefreshCw, Edit2 } from 'lucide-react'
import { getAllInventory, updateInventoryStock, getLowStockItems } from '@/lib/api/admin'
import { InventoryItem } from '@/types/admin'

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockQuantity, setRestockQuantity] = useState(0)

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    let filtered = inventory

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterLowStock) {
      filtered = filtered.filter(item => item.isLowStock)
    }

    setFilteredInventory(filtered)
  }, [searchQuery, filterLowStock, inventory])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await getAllInventory()
      setInventory(data)
      setFilteredInventory(data)
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestockClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setRestockQuantity(0)
    setIsRestockModalOpen(true)
  }

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    try {
      const newQuantity = selectedItem.quantity + restockQuantity
      const updated = await updateInventoryStock(selectedItem.id, newQuantity)
      
      setInventory(inventory.map(item => 
        item.id === updated.id ? updated : item
      ))
      setIsRestockModalOpen(false)
    } catch (error) {
      console.error('Error restocking inventory:', error)
      alert('Failed to update inventory')
    }
  }

  const totalSKUs = inventory.length
  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockCount = inventory.filter(item => item.isLowStock).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Loading Inventory...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-border pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide font-mono">
          Inventory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage stock levels and restock products
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total SKUs"
          value={totalSKUs}
          icon={Package}
          description="Unique product variants"
        />
        <StatCard
          title="Total Stock Units"
          value={totalStock}
          icon={Package}
          description="Items in warehouse"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          description="Need restocking"
          className={lowStockCount > 0 ? "border-primary" : ""}
        />
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product, SKU, size, or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-border focus-visible:ring-primary"
            />
          </div>
          <Button
            variant={filterLowStock ? "default" : "outline"}
            onClick={() => setFilterLowStock(!filterLowStock)}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Low Stock Only
          </Button>
          <div className="text-sm font-bold text-muted-foreground whitespace-nowrap">
            {filteredInventory.length} of {inventory.length} items
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="p-6">
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-bold">No inventory items found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterLowStock ? 'Try adjusting your filters' : 'No inventory data available'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold">{item.productName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.sku}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-muted">
                      {item.size}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-muted">
                      {item.color}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold font-mono">
                    {item.quantity}
                  </TableCell>
                  <TableCell>
                    {item.isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-primary/20 text-primary">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-secondary/20 text-secondary">
                        In Stock
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestockClick(item)}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Restock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Restock Inventory"
      >
        {selectedItem && (
          <form onSubmit={handleRestockSubmit}>
            <div className="space-y-4">
              <div className="p-4 border-2 border-border bg-muted/20">
                <h3 className="font-bold text-lg">{selectedItem.productName}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-bold">SKU:</span> {selectedItem.sku}</p>
                  <p><span className="font-bold">Size:</span> {selectedItem.size}</p>
                  <p><span className="font-bold">Color:</span> {selectedItem.color}</p>
                  <p><span className="font-bold">Current Stock:</span> {selectedItem.quantity} units</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Add Quantity *
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value))}
                  placeholder="Enter quantity to add"
                  className="border-2 border-border"
                />
              </div>

              <div className="p-4 border-2 border-border bg-accent/10">
                <p className="text-sm font-bold">
                  New Stock Level: {selectedItem.quantity + (restockQuantity || 0)} units
                </p>
              </div>
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRestockModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Confirm Restock
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </div>
  )
}
