import bpy

#Set render params (write to disk, don't render in Blender)
bpy.context.scene.luxrender_engine.write_files = True
bpy.context.scene.luxrender_engine.render = False

#Try to find the installed luxrender version (there must be a better way, but different 
#    versions of blender 2.5x/2.6x handle this differently)
lux_versions = ['LUXRENDER_RENDER', 'luxrender-1.0.0.rc3', 'luxrender-1.0.0.rc2', 'luxrender-1.0.0.rc1',
                'luxrender-0.9.0.dev', 'luxrender-0.9.0.', 'luxrender-0.8.0.'];
for v in lux_versions:
    try:
        bpy.context.scene.render.engine = v;
        break;
    except:
        pass;

#Get obj names from input
maskObjNames = OBJ_NAMES_PLACEHOLDER #e.g. ['Monkey', 'Torus']

#Render with objects in the scene
bpy.context.scene.frame_set(1)
bpy.context.scene.render.filepath = '//render'
bpy.ops.render.render()

#Render without objects
bpy.context.scene.frame_set(2)
bpy.context.scene.render.filepath = '//empty'
try:
    bpy.ops.object.mode_set(mode='OBJECT') #Make sure we're in obj mode
except:
    pass;
bpy.ops.object.select_all(action='DESELECT') #Remove selection
for mo_name in maskObjNames:
    bpy.data.objects[mo_name].select = True
    
bpy.ops.object.delete()
bpy.ops.render.render()
