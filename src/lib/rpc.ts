// GENERATED FILE, DO NOT EDIT!!!
/* eslint-disable @typescript-eslint/no-explicit-any */

import OpenMowerBaseRpc from './rpc-base'

export type StringDoaGddGA = string
export type StringXJCrhoiv = string
export type String88NWwqIE = string
export interface ObjectHAgrRKSz {
  [key: string]: any
}
export type StringZDJW5SIj = 'pong'
export type UnorderedSetOfStringDoaGddGADvj0XlFa = StringDoaGddGA[]
export type NullQu0Arl1F = null
export interface ObjectUDrdQYBN {
  [key: string]: any
}

export class OpenMowerRpc extends OpenMowerBaseRpc {
  rpc = {
    ping: async (): Promise<StringZDJW5SIj> => this.call('rpc.ping'),
    methods: async (): Promise<UnorderedSetOfStringDoaGddGADvj0XlFa> => this.call('rpc.methods'),
  }
  map = {
    replace: async (...args: [map: ObjectHAgrRKSz]): Promise<void> => this.call('map.replace', args),
  }
  meta = {
    rpc: {
      ping: async (): Promise<StringZDJW5SIj> => this.call('meta.rpc.ping'),
    },
    config: {
      schema: async (): Promise<StringDoaGddGA> => this.call('meta.config.schema'),
      defaults: async (): Promise<ObjectUDrdQYBN> => this.call('meta.config.defaults'),
    },
  }
}
