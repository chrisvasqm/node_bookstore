import { Author } from '@prisma/client';
import prisma from '../../prisma/client';

export const getAll = () => {
    return prisma.author.findMany();
}

export const findAuthor = (id: number) => {
    return prisma.author.findUnique({ where: { id } });
}

export const createAuthor = (name: string) => {
    return prisma.author.create({ data: { name } });
}

export const updateAuthor = ({ id, name }: Author) => {
    return prisma.author.update({ where: { id }, data: { name } });
}

export const deleteAuthor = (id: number) => {
    return prisma.author.delete({ where: { id } });
}