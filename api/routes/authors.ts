import { Author } from '@prisma/client';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import prisma from '../../prisma/client';
import auth from '../middleware/auth';
import { createAuthor, deleteAuthor, findAuthor, getAll as getAllAuthors, updateAuthor } from '../services/authorsService';

const schema = z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name can not be empty.')
})

const router = Router();

router.get('/', auth, async (_, response) => {
    const authors = await getAllAuthors();
    response.send(authors);
});

router.post('/', auth, async (request, response) => {
    const body = request.body as Author;
    const validation = schema.safeParse(body);
    if (!validation.success) return response.status(400).send(validation.error.format());

    const author = await createAuthor(body.name);

    response.status(201).send(author)
});

router.get('/:id', auth, async (request, response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return response.status(404).send('Author not found');

    const author = await findAuthor(id);
    if (!author) return response.status(404).send('Author not found');

    response.send(author);
});

router.put('/:id', auth, async (request, response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return response.status(404).send('Author not found');

    const body = request.body as Author;
    const validation = schema.safeParse(body);
    if (!validation.success) return response.status(400).send(validation.error.format());

    const author = await findAuthor(id);
    if (!author) return response.status(404).send('Author not found');

    const updatedAuthor = await updateAuthor({ id, name: body.name });

    response.send(updatedAuthor);
});

router.delete('/:id', auth, async (request, response) => {
    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return response.status(404).send('Author not found');

    const author = await findAuthor(id);
    if (!author) return response.status(404).send('Author not found');

    const deletedAuthor = await deleteAuthor(id);

    response.send(deletedAuthor);
});

router.get('/:authorId/books', auth, async (request, response) => {
    const authorId = parseInt(request.params.authorId, 10);
    if (isNaN(authorId)) return response.status(404).send('Author not found');

    const author = await findAuthor(authorId)
    if (!author) return response.status(404).send('Author not found');

    const books = await prisma.book.findMany({ where: { authorId: author.id } });

    response.send(books);
});

router.get('/:authorId/books/:bookId', auth, async (request, response) => {
    const authorId = parseInt(request.params.authorId, 10);
    if (isNaN(authorId)) return response.status(404).send('Author not found');

    const author = await findAuthor(authorId);
    if (!author) return response.status(404).send('Author not found');

    const bookId = parseInt(request.params.bookId, 10);
    if (isNaN(bookId)) return response.status(404).send('Book not found');

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return response.status(404).send('Book not found');

    const books = await prisma.book.findUnique({
        where: {
            id: bookId,
            authorId: authorId
        }
    });

    response.send(books);
});

export default router;
