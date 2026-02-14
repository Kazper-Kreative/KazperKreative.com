import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'lead',
  title: 'Project Lead',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
      options: {
        list: [
          { title: 'Game Development', value: 'game-dev' },
          { title: 'Web Application', value: 'web-app' },
          { title: 'QA Validation', value: 'qa' },
          { title: 'Automation', value: 'automation' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'budget',
      title: 'Budget Range',
      type: 'string',
      options: {
        list: [
          { title: '< $5k', value: 'under-5k' },
          { title: '$5k - $15k', value: '5k-15k' },
          { title: '$15k - $50k', value: '15k-50k' },
          { title: '$50k+', value: '50k-plus' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Project Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'In Review', value: 'in-review' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Archive', value: 'archived' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'projectType',
    },
  },
})
