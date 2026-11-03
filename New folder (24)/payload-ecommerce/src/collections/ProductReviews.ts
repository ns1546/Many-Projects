import type { CollectionConfig } from 'payload'

export const ProductReviews: CollectionConfig = {
  slug: 'product-reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', 'rating', 'user', 'status'],
  },
  access: {
    create: ({ req: { user } }) => Boolean(user), // Must be logged in to leave a review
    read: () => true, // Anyone can read published reviews
    update: ({ req: { user } }) => Boolean(user), // Admins can update
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      hasMany: false,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'review',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Published', value: 'published' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
