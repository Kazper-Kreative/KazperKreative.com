import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'job',
  title: 'Job',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'assignedAgent',
      title: 'Assigned Agent',
      type: 'reference',
      to: [{ type: 'agent' }],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'PENDING' },
          { title: 'Active', value: 'ACTIVE' },
          { title: 'In Review', value: 'IN_REVIEW' },
          { title: 'Completed', value: 'COMPLETED' },
          { title: 'Declined', value: 'DECLINED' },
        ],
      },
      initialValue: 'PENDING',
    }),
    defineField({
      name: 'description',
      title: 'Brief Description',
      type: 'text',
    }),
    defineField({
      name: 'milestones',
      title: 'Milestones',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string' },
            { name: 'completed', type: 'boolean', initialValue: false },
          ],
        },
      ],
    }),
  ],
})
