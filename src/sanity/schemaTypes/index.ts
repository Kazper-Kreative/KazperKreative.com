import { type SchemaTypeDefinition } from 'sanity'
import project from './project'
import service from './service'
import agent from './agent'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, service, agent],
}
