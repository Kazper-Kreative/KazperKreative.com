import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'applicant',
  title: 'Applicant',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'callsign',
      title: 'Callsign',
      type: 'string',
      description: 'Preferred agent handle/alias',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Desired Role',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'experience',
      title: 'Years of Experience',
      type: 'number',
    }),
    defineField({
      name: 'portfolioUrl',
      title: 'Portfolio URL',
      type: 'url',
    }),
    defineField({
      name: 'bio',
      title: 'Mission Statement',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['PENDING_REVIEW', 'UNDER_EVALUATION', 'ACCEPTED', 'DECLINED'],
      },
      initialValue: 'PENDING_REVIEW',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
