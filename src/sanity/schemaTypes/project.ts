import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
        name: 'caseStudyUrl',
        title: 'Case Study URL',
        type: 'url',
    }),
    defineField({
      name: 'caseStudyContent',
      title: 'Case Study Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'technicalChallenge',
      title: 'Technical Challenge',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'solutionArchitecture',
      title: 'Solution Architecture',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'impactMetrics',
      title: 'Impact Metrics',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'gallery',
      title: 'Project Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'interactiveMetadata',
      title: 'Interactive 3D Metadata',
      type: 'text',
      description: 'JSON metadata for interactive scene overlays or 3D behavior.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
})
