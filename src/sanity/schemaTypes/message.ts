import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'message',
  title: 'Message',
  type: 'document',
  fields: [
    defineField({
      name: 'job',
      title: 'Job',
      type: 'reference',
      to: [{ type: 'job' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sender',
      title: 'Sender (Email)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
