function writeLuxrenderScene(blendfile, BLENDER_BIN, renderparams)        
%     %example render params:    
%     renderparams.h = 10;
%     renderparams.w = 10;
%     renderparams.halt_spp = 50;
%     renderparams.outpath = '//';
    
    tmppy = ['.tmp-' timestamp() '.py'];
    fid = fopen(tmppy, 'w');
    fprintf(fid, 'import bpy\n');
    if(exist('renderparams', 'var'))
        fprintf(fid, 'bpy.context.scene.render.filepath = "%s"\n', renderparams.outpath);
        fprintf(fid, 'bpy.context.scene.render.resolution_x = %d\n', renderparams.w);
        fprintf(fid, 'bpy.context.scene.render.resolution_y = %d\n', renderparams.h);
        fprintf(fid, 'bpy.context.scene.luxrender_sampler.haltspp = %d\n', renderparams.halt_spp);
    end
    fprintf(fid, 'bpy.context.scene.luxrender_engine.write_files = True\n');
    fprintf(fid, 'bpy.context.scene.luxrender_engine.render = False\n');
    fprintf(fid, 'bpy.ops.render.render()\n');
    fprintf(fid, '\n');
    fclose(fid);
    system(sprintf('%s -b %s -P %s -E luxrender', BLENDER_BIN, blendfile, tmppy));
    delete(tmppy);
end