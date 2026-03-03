import { getErrorMessage } from '@/lib/api'
import { AxiosError } from 'axios'

describe('API Utilities', () => {
  describe('getErrorMessage', () => {
    it('should extract message from standardized error format', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            error: {
              message: 'Custom error message',
            },
          },
        },
      } as unknown as AxiosError

      expect(getErrorMessage(error)).toBe('Custom error message')
    })

    it('should extract detail field from error response', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            detail: 'Detail error message',
          },
        },
      } as unknown as AxiosError

      expect(getErrorMessage(error)).toBe('Detail error message')
    })

    it('should extract field-specific errors', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            username: ['This field is required.'],
          },
        },
      } as unknown as AxiosError

      expect(getErrorMessage(error)).toBe('This field is required.')
    })

    it('should return network error message', () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error',
      } as unknown as AxiosError

      expect(getErrorMessage(error)).toBe('Error de red. Verifica tu conexión a internet.')
    })

    it('should return status-specific messages', () => {
      const error500 = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {},
        },
      } as unknown as AxiosError

      expect(getErrorMessage(error500)).toBe('Error del servidor. Intenta nuevamente más tarde.')

      const error404 = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {},
        },
      } as unknown as AxiosError

      expect(getErrorMessage(error404)).toBe('Recurso no encontrado.')

      const error403 = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {},
        },
      } as unknown as AxiosError

      expect(getErrorMessage(error403)).toBe('No tienes permisos para realizar esta acción.')
    })

    it('should return generic message for Error objects', () => {
      const error = new Error('Something went wrong')

      expect(getErrorMessage(error)).toBe('Something went wrong')
    })

    it('should return generic message for unknown errors', () => {
      const error = 'string error'

      expect(getErrorMessage(error)).toBe('Ocurrió un error inesperado')
    })
  })
})
