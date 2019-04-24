function scene = parseAnnotations( annotation_file )
    scene.lights = {};
    scene.shafts = {};
    scene.shaft_angle = [];
    scene.shaft_2d_source = [];
    scene.surfs = {};
    fid = fopen(annotation_file,'r');
    line = fgetl(fid);
    while(ischar(line))
        if( isempty(line) || line(1)=='#' )
            line = fgetl(fid);
            continue;
        end
        tok = strtok(line, ' ');
        if( strcmp(tok,'box') )
            scene.box = readPolygon(fid);
        elseif( strcmp(tok,'box3d') )
            scene.box3d = readPolygon3d(fid);
        elseif( strcmp(tok, 'K') )
            scene.K = reshape(cell2mat(textscan(fid, '%f', 9)), [3,3])';
            fgetl(fid); %clear to next line
        elseif( strcmp(tok, 'R') )
            scene.R = reshape(cell2mat(textscan(fid, '%f', 9)), [3,3])';
            fgetl(fid); %clear to next line
        elseif( strcmp(tok,'light') )
            tmp = readPolygon(fid);
            if(size(tmp,1)>2)
                scene.lights{end+1} = tmp; %#ok<*AGROW>
            end
        elseif( strcmp(tok,'surface') )
            tmp = readPolygon(fid);
            tmpsurf.poly = tmp(1:end-2,:);
            tmpsurf.height = tmp(end-1:end,:);
            tmpsurf.solid = (str2double(fgetl(fid))~=0);
            if(size(tmp,1)>2)
                scene.surfs{end+1} = tmpsurf;
            end
        elseif( strcmp(tok,'shaft') )
            tmpshaft.poly = readPolygon(fid);
            tmpshaft.matte = (str2double(fgetl(fid))~=0);
            if(size(tmp,1)>2)
                scene.shafts{end+1} = tmpshaft;
            end
        elseif( strcmp(tok,'shaft_angle') )
            scene.shaft_angle = cell2mat(textscan(fid, '%f %f', 1));
            fgetl(fid); %clear to next line
        elseif( strcmp(tok,'shaft_2d_source') )
            scene.shaft_2d_source = cell2mat(textscan(fid, '%f %f', 1));
            fgetl(fid); %clear to next line
        end
        line = fgetl(fid);
    end
end

function p = readPolygon(fid)
    npts = str2double(strtok(fgetl(fid),' '));
    p = cell2mat(textscan(fid, '%f %f', npts));
    fgetl(fid); %clear to next line after end of polygon
end


function p = readPolygon3d(fid)
    npts = str2double(strtok(fgetl(fid),' '));
    p = cell2mat(textscan(fid, '%f %f %f', npts));
    fgetl(fid); %clear to next line after end of polygon
end
