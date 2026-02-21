import { describe, it, expect, vi } from 'vitest'
import { sendSuccess, sendError, generateId } from '../utils'
import { NextApiResponse } from 'next'

describe('Backend Utilities', () => {
    describe('generateId', () => {
        it('generates a string ID', () => {
            const id = generateId()
            expect(typeof id).toBe('string')
            expect(id.length).toBeGreaterThan(5)
        })

        it('generates unique IDs', () => {
            const id1 = generateId()
            const id2 = generateId()
            expect(id1).not.toBe(id2)
        })
    })

    describe('sendSuccess', () => {
        it('calls res.status and res.json with success true and data', () => {
            const mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
            } as unknown as NextApiResponse

            const testData = { foo: 'bar' }
            sendSuccess(mockRes, testData)

            expect(mockRes.status).toHaveBeenCalledWith(200)
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: testData,
            })
        })

        it('uses custom status code if provided', () => {
            const mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
            } as unknown as NextApiResponse

            sendSuccess(mockRes, {}, 201)
            expect(mockRes.status).toHaveBeenCalledWith(201)
        })
    })

    describe('sendError', () => {
        it('calls res.status and res.json with success false and error message', () => {
            const mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
            } as unknown as NextApiResponse

            const message = 'Something went wrong'
            sendError(mockRes, message, 400)

            expect(mockRes.status).toHaveBeenCalledWith(400)
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: message,
            })
        })
    })
})
