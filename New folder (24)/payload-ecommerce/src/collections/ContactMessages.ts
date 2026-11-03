import type { CollectionConfig } from 'payload'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'subject', 'createdAt'],
  },
  access: {
    create: () => true, // Anyone can submit a contact form
    read: ({ req: { user } }) => Boolean(user), // Only admins can read
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'unread',
      options: [
        { label: 'Unread', value: 'unread' },
        { label: 'Read', value: 'read' },
        { label: 'Responded', value: 'responded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
