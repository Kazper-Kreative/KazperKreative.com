import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'agent',
  title: 'Agent',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'upworkUrl',
      title: 'Upwork URL',
      type: 'url',
    }),
    defineField({
      name: 'xp',
      title: 'XP',
      type: 'number',
      initialValue: 1000,
    }),
    defineField({
      name: 'rank',
      title: 'Rank',
      type: 'string',
      options: {
        list: [
          { title: 'Recruit', value: 'RECRUIT' },
          { title: 'Specialist', value: 'SPECIALIST' },
          { title: 'Elite', value: 'ELITE' },
          { title: 'Commander', value: 'COMMANDER' },
        ],
      },
      initialValue: 'RECRUIT',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Strike Ready', value: 'STRIKE_READY' },
          { title: 'On Mission', value: 'ON_MISSION' },
          { title: 'Standby', value: 'STANDBY' },
        ],
      },
      initialValue: 'STRIKE_READY',
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
})
