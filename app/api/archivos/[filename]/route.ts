import { NextResponse } from 'next/server';
import { join } from 'path';
import { stat } from 'fs/promises';
import { createReadStream, ReadStream } from 'fs';
import type { NextRequest } from 'next/server';
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import { getTokenFromHeader } from '@/lib/auth';

interface Params {
    params: Promise<{filename: string}>
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const token = getTokenFromHeader(request)
        if (!token) {
            return err("Token requerido", 401)
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return err("Token inválido", 401)
        }

        const { filename } = await params;

        // Validación básica: evitar acceso a directorios padres
        if (filename.includes('..')) {
            return err('Acceso no permitido', 400 );
        }

        const filePath = join(process.cwd(), 'uploads', filename);
        console.log(process.cwd());
        

        // Verificar que el archivo exista
        await stat(filePath);

        // Crear stream de lectura
        const stream = createReadStream(filePath);

        // Determinar el tipo MIME (opcionalmente puedes usar 'mime-types')
        const ext = filename.split('.').pop()?.toLowerCase();
        const contentType = {
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            txt: 'text/plain',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }[ext ?? ''] || 'application/octet-stream';

        return new NextResponse( stream as any, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        return internalServerError();
    }
}
