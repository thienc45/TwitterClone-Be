import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandle } from '~/📂utils/handles'
export const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandle(uploadImageController as any)
)

mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandle(uploadVideoController as any)
)
mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandle(uploadVideoHLSController as any)
)
mediasRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandle(videoStatusController as any)
)
