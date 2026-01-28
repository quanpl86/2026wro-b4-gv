import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        // Get options from formData with defaults
        const colorPrecision = formData.get('colorPrecision') || '6';
        const filterSpeckle = formData.get('filterSpeckle') || '4';
        const spliceThreshold = formData.get('spliceThreshold') || '45';
        const pathPrecision = formData.get('pathPrecision') || '2';
        const mode = formData.get('mode') || 'spline';
        const cornerThreshold = formData.get('cornerThreshold') || '60';
        const lengthThreshold = formData.get('lengthThreshold') || '4.0';
        const hierarchical = formData.get('hierarchical') || 'stacked'; // 'stacked' to eliminate gaps
        const maxIterations = formData.get('maxIterations') || '10';
        const layerDifference = formData.get('layerDifference') || '16';

        if (!file) {
            return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const tempDir = os.tmpdir();
        const inputPath = join(tempDir, `${uuidv4()}.png`);
        const outputPath = join(tempDir, `${uuidv4()}.svg`);

        await writeFile(inputPath, buffer);

        // Run vtracer via python3 with heritage-grade detail params
        const pythonCommand = `import vtracer; vtracer.convert_image_to_svg_py("${inputPath}", "${outputPath}", mode="${mode}", color_precision=${colorPrecision}, filter_speckle=${filterSpeckle}, splice_threshold=${spliceThreshold}, path_precision=${pathPrecision}, corner_threshold=${cornerThreshold}, length_threshold=${lengthThreshold}, hierarchical="${hierarchical}", layer_difference=${layerDifference}, max_iterations=${maxIterations})`;

        const pythonProcess = spawn('python3', ['-c', pythonCommand]);

        return new Promise((resolve) => {
            pythonProcess.on('close', async (code) => {
                if (code === 0) {
                    try {
                        const { readFile } = await import('fs/promises');
                        const svgContent = await readFile(outputPath, 'utf8');

                        // Cleanup
                        await unlink(inputPath);
                        await unlink(outputPath);

                        resolve(NextResponse.json({ svg: svgContent }));
                    } catch (err) {
                        resolve(NextResponse.json({ error: 'Failed to read output' }, { status: 500 }));
                    }
                } else {
                    resolve(NextResponse.json({ error: 'Vectorization failed' }, { status: 500 }));
                }
            });
        });

    } catch (error) {
        console.error('Vectorize error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
