import bpy

#Get obj names from input
maskObjNames = OBJ_NAMES_PLACEHOLDER #e.g. ['Monkey', 'Torus']

#Get object mask
maskObjs = []
for i in range(len(maskObjNames)):
    maskObjs.append( bpy.data.objects[maskObjNames[i]] )

blackmat = bpy.data.materials.new('black_mask')
blackmat.diffuse_color = [0,0,0]
blackmat.diffuse_intensity = 0
blackmat.use_shadeless = True
blackmat.use_shadows = False
whitemat = bpy.data.materials.new('white_mask')
whitemat.diffuse_color = [1,1,1]
whitemat.diffuse_intensity = 1
whitemat.use_shadeless = True
whitemat.use_shadows = False
for o in reversed(bpy.data.objects):
    try:
        isMObj = False
        for mo in maskObjs:
            if( o == mo ):
                isMObj = True
                break
        for i in range(1,len(o.data.materials.values())):
            o.data.materials.pop(i)
        if( isMObj==True ):
            if(len(o.data.materials)>0):
                o.material_slots[0].material = whitemat
            else:
                o.data.materials.append(whitemat)
        else:
            if(len(o.data.materials)>0):
                o.material_slots[0].material = blackmat
            else:
                o.data.materials.append(blackmat)
        for i in range(len(o.data.materials[0].texture_slots)):
            o.data.materials[0].texture_slots.clear(i)         
    
    except:
        isMObj = False
        print(o.name)
        
#Write mask
bpy.context.scene.render.engine = 'BLENDER_RENDER'
bpy.context.scene.render.filepath = '//mask'
bpy.ops.render.render(write_still=True)
