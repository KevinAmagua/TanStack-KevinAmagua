 /**
  * OpenLibrary Mappers
  * Responsabilidad: Transformar DTOs de OpenLibrary a entidades de dominio
  */

 import {
   OpenLibraryBookDTO,
   OpenLibrarySearchResponseDTO,
   OpenLibraryWorkDetailDTO,
   Book,
   BookDetail,
 } from '@/types/book.types';

 export function mapOpenLibraryBookToDomain(dto: OpenLibraryBookDTO): Book {
   const id = dto.key.replace('/works/', '').replace('/books/', '');

   const coverUrl = dto.cover_i
     ? 'https://covers.openlibrary.org/b/id/' + dto.cover_i + '-M.jpg'
     : undefined;

   return {
     id,
     title: dto.title,
     authors: dto.author_name || [],
     coverUrl,
     firstPublishYear: dto.first_publish_year,
     editionCount: dto.edition_count,
     isbn: dto.isbn,
     subjects: dto.subject,
     publisher: dto.publisher,
   };
 }

 export function mapOpenLibrarySearchToDomain(dto: OpenLibrarySearchResponseDTO): Book[] {
   return dto.docs.map(mapOpenLibraryBookToDomain);
 }

 export function mapOpenLibraryWorkDetailToDomain(
   dto: OpenLibraryWorkDetailDTO,
   baseBook?: Partial<Book>
 ): BookDetail {
   let description: string | undefined;
   if (typeof dto.description === 'string') {
     description = dto.description;
   } else if (dto.description && typeof dto.description === 'object') {
     description = (dto.description as any).value;
   }

   const covers = dto.covers?.map(
     (coverId) => 'https://covers.openlibrary.org/b/id/' + coverId + '-L.jpg'
   );

   return {
     id: baseBook?.id || '',
     title: dto.title || baseBook?.title || '',
     authors: baseBook?.authors || [],
     coverUrl: covers?.[0] || baseBook?.coverUrl,
     description,
     covers,
     subjects: dto.subjects,
     firstPublishDate: dto.first_publish_date,
   };
 }
