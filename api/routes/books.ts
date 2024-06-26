import { Request, Response, Router } from 'express';
import prisma from '../../prisma/client';
import { z } from 'zod';
import { Book } from '@prisma/client';
import auth from '../middleware/auth';

const schema = z.object({
    title: z.string({ required_error: 'Title is required' }).min(1, 'Title can not be empty').max(255, 'Title can must be 255 characters long'),
    description: z.string({ required_error: 'Description is required' }).min(1, 'Description can not be empty'),
    authorId: z.number()
})

const router = Router();

router.get('/', auth, async (_: Request, response: Response) => {
    const books = await prisma.book.findMany({ include: { author: { select: { name: true } } } });
    response.send(books);
});

router.post('/', auth, async (request: Request, response: Response) => {
    const body = request.body as Book;
    const validation = schema.safeParse(body);
    if (!validation.success) return response.status(400).send(validation.error.format());

    const author = await prisma.author.findUnique({ where: { id: body.authorId } });
    if (!author) return response.status(404).send('Author not found');

    const book = await prisma.book.create({
        data: {
            title: body.title,
            description: body.description,
            authorId: body.authorId
        }
    });

    response.status(201).send(book);
});

router.get('/:id', auth, async (request: Request, response: Response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return response.status(404).send('Book not found');

    const book = await prisma.book.findUnique({
        where: { id },
        include: { author: { select: { name: true } } }
    });
    if (!book) return response.status(404).send('Book not found');

    response.send(book);
});

router.put('/:id', auth, async (request: Request, response: Response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return response.status(404).send('Book not found');

    const body = request.body as Book;
    const validation = schema.safeParse(body);
    if (!validation.success) return response.status(400).send(validation.error.format());

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) return response.status(404).send('Book not found');

    const updatedBook = await prisma.book.update({
        where: { id },
        data: {
            title: body.title,
            description: body.description,
            authorId: body.authorId
        }
    });

    response.send(updatedBook);
});

router.delete('/:id', auth, async (request: Request, response: Response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return response.status(404).send('Book not found');

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) return response.status(404).send('Book not found');

    const deletedBook = await prisma.book.delete({ where: { id } });

    response.send(deletedBook);
});

export default router;