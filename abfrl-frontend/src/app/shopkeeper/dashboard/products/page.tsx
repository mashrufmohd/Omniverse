'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/table'
import { Modal, ModalFooter } from '@/components/admin/modal'
import { Card } from '@/components/ui/card'
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Package } from 'lucide-react'
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api/admin'
import { Product } from '@/types'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    image_url: '',
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      price: 0,
      description: '',
      category: '',
      image_url: '',
    })
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      image_url: product.image_url || product.imageUrl,
    })
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, formData)
        setProducts(products.map(p => p.id === updated.id ? updated : p))
      } else {
        const created = await createProduct(formData)
        setProducts([...products, created])
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Loading Products...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide font-mono">
            Products
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2">
          <Plus className="h-5 w-5" />
          Add Product
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-border focus-visible:ring-primary"
            />
          </div>
          <div className="text-sm font-bold text-muted-foreground">
            {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-bold">No products found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first product'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                      {product.image_url || product.imageUrl ? (
                        <img 
                          src={product.image_url || product.imageUrl} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{product.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-accent/20">
                      {product.category || 'Uncategorized'}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold font-mono">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {product.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="h-8 w-8 p-0 border-2 border-border hover:bg-accent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-8 w-8 p-0 border-2 border-border hover:bg-primary hover:text-primary-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Product Name *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="border-2 border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Price *
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="border-2 border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Shirts, Pants"
                  className="border-2 border-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-3 py-2 border-2 border-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Image URL
              </label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="border-2 border-border"
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
