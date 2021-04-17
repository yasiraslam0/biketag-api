import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios'
import { EventEmitter } from 'events'
// import { getAuthorizationHeader } from './getAuthorizationHeader'
import { BIKETAG_API_PREFIX } from './common/endpoints'
import {
  Credentials,
  TagData,
  BikeTagApiResponse,
  SanityCredentials,
  ImgurCredentials,
} from './common/types'
import { tagDataFields } from './common/data'
import { constructTagNumberSlug } from './common/methods'

import * as sanityApi from './sanity'
import * as imgurApi from './imgur'
import * as biketagApi from './biketag'

// @ts-ignore
import { ImgurClient, ImgurConfig } from './imgurClient'
import sanityClient, { SanityClient, ClientConfig as SanityConfig } from '@sanity/client'

const USERAGENT = 'biketag-api (https://github.com/keneucker/biketag-api)'

export class BikeTagClient extends EventEmitter {
  private fetcher: AxiosInstance
  private mostAvailableApi: string
  private imgurClient: ImgurClient
  private imgurConfig: ImgurConfig
  private sanityClient: SanityClient
  private sanityConfig: SanityConfig

  constructor(readonly credentials: Credentials) {
    super()

    this.mostAvailableApi = ""
    
    this.imgurConfig = credentials as ImgurCredentials
    this.imgurClient = new ImgurClient(this.imgurConfig)
    this.sanityConfig = credentials as SanityCredentials
    this.sanityClient = sanityClient(this.sanityConfig)

    this.fetcher = axios.create({
      baseURL: BIKETAG_API_PREFIX,
      headers: {
        'user-agent': USERAGENT,
      },
      responseType: 'json',
      // hooks: {
      //   beforeRequest: [
      //     async (options: any) => {
      //       options.headers['authorization'] = await getAuthorizationHeader(
      //         this
      //       )
      //     },
      //   ],
      // },
    })
  }

  private initializeImgurApi(options: ImgurCredentials): ImgurClient {
    return new ImgurClient(options)
  }

  private initializeSanityApi(options: SanityCredentials): SanityClient {
    return sanityClient(options)
  }
  
  private getMostAvailableAPI(): string {
    if (this.mostAvailableApi.length) {
      return this.mostAvailableApi
    }

    /// TODO: determine if a biketag server is available
    /// TODO: determine if sanity permissions are available
    /// TODO: default to imgur api
    return this.mostAvailableApi = "sanity"
  }

  getConfiguration() {
    return {
      sanity: this.sanityConfig,
      imgur: this.imgurConfig,
      // sanity: this.sanityConfig,
    }
  }

  plainRequest(
    options: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<any>> {
    return this.fetcher(options).then(response => response.data)
  }

  request(
    options: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<string>> {
    return this.fetcher(options)
  }

  // deleteImage(imageHash: string): Promise<BikeTagApiResponse<boolean>> {
  //   switch (this.getMostAvailableAPI()) {
  //     case "imgur":
  //       return imgur.deleteImage(this, imageHash)
  //     break
  //   }
  // }

  // /// TODO: this should be for getting an album
  // getArchive(options: ArchiveOptions): Promise<BikeTagApiResponse<ArchiveData>> {
  //   return getArchive(this, options)
  // }

  getTag(options: number | string | any): Promise<BikeTagApiResponse<TagData>> {
    const clientString = this.getMostAvailableAPI()
    let client: any = null
    let api: any = null

    options = typeof options === 'string' ? { slug: options } : options
    options = typeof options === 'number' ? { slug: constructTagNumberSlug(options) } : options
    options.slug = options.slug ? options.slug : constructTagNumberSlug(options.tagnumber, options.game)
    options.fields = options.fields ? options.fields : tagDataFields

    switch (clientString) {
      case "sanity":
        client = this.sanityClient
        api = sanityApi
        break
      case "imgur":
        client = this.imgurClient
        api = imgurApi
        break
      default:
      case "biketag":
        client = api = biketagApi
        break
    }

    return api.getTag(client, options)
  }

  // updateImage(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return updateImage(this, payload)
  // }

  // upload(
  //   payload: string | string[] | Payload | Payload[]
  // ): Promise<BikeTagApiResponse<TagData> | BikeTagApiResponse<TagData>[]> {
  //   return upload(this, payload)
  // }

  // getBikeTag(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   switch (this.getMostAvailableAPI()) {
  //     case "imgur":
  //       return getBikeTag(this, payload)
  //       break
  //     case "sanity":
  //       return 
  //   }
  // }

  // getBikeTagMysteryImage(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return getBikeTagMysteryImage(this, payload)
  // }

  // getBikeTagFoundImage(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return getBikeTagFoundImage(this, payload)
  // }

  // queueBikeTagFoundImage(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return queueBikeTagFoundImage(this, payload)
  // }

  // queueBikeTagMysteryImage(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return queueBikeTagMysteryImage(this, payload)
  // }

  // getQueuedImages(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return getQueuedImages(this, payload)
  // }

  // getQueue(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return getQueue(this, payload)
  // }

  // completeBikeTagRound(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return completeBikeTagRound(this, payload)
  // }

  // getBikeTagRound(
  //   payload: UpdateImagePayload | UpdateImagePayload[]
  // ): Promise<BikeTagApiResponse<boolean> | BikeTagApiResponse<boolean>[]> {
  //   return getBikeTagRound(this, payload)
  // }

  content(options: any = {}): SanityClient {
    if (!options || !Object.keys(options).length) {
      return this.sanityClient
    }

    return this.initializeSanityApi(options)
  }

  images(options: any = {}): ImgurClient {
    if (!options || !Object.keys(options).length) {
      return this.imgurClient
    }
    
    return this.initializeImgurApi(options)
  }

  data(): BikeTagClient {
    return this
  }
}