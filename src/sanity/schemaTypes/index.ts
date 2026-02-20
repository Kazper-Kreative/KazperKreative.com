import { type SchemaTypeDefinition } from 'sanity'
import project from './project'
import service from './service'
import agent from './agent'
import lead from './lead'
import client from './client'
import job from './job'
import message from './message'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, service, agent, lead, client, job, message],
}
