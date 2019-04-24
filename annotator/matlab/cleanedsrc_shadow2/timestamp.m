function t = timestamp()
%TIMESTAMP gets a unique timestamp 
    t = datestr(now, 'yymmddHHMMSSFFF');
end

