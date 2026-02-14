import { type SchemaTypeDefinition } from 'sanity'
import project from './project'
import service from './service'
import agent from './agent'
import lead from './lead'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, service, agent, lead],
}
