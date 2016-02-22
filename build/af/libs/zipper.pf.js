/* global self */

var $$ = this;

export default {
    zipper : {
        unzip : function(file, callback){
            var fileReader= null;
            if($$.FileReader){
                fileReader= new $$.FileReader();
                var self= this;

                fileReader.onloadend= function(){
                    var reader= new self.ZipReader(this.result);
                    var zip= new self.ZipRecord();

                    while(reader.bytesLeft()){
                        self.readNextBySignature(self.readSignature(reader), reader, zip);
                    }
                    callback(zip);
                };
                fileReader.readAsArrayBuffer(file);
            }else if($$.FileReaderSync){
                fileReader= new $$.FileReaderSync();
                var reader= new this.ZipReader( fileReader.readAsArrayBuffer(file) );
                var zip= new this.ZipRecord();

                while(reader.bytesLeft()){
                    this.readNextBySignature(this.readSignature(reader), reader, zip);
                }
                callback(zip);
            }else{
                console.error('no FileReader available in this context!');
            }
        },

        createBlob : function(zipRecord, onProgress){
            var writer= new this.ZipWriter();
            var self= this;
            var p= 100 / (zipRecord.files.length + zipRecord.file_headers.length + zipRecord.extra_data.length + zipRecord.signatures.length + zipRecord.zip64_end_record.length + zipRecord.end_record.length);
            var count= 0;

            zipRecord.files.forEach(function(item){
                self.writeFile(item, writer);
                onProgress(Math.round(++count * p));
            });
            zipRecord.file_headers.forEach(function(item){
                self.writeFileHader(item, writer);
                onProgress(Math.round(++count * p));
            });
            zipRecord.extra_data.forEach(function(item){
                self.writeExtraData(item, writer);
                onProgress(Math.round(++count * p));
            });
            zipRecord.signatures.forEach(function(item){
                self.writeDigitalSignature(item, writer);
                onProgress(Math.round(++count * p));
            });
            zipRecord.zip64_end_record.forEach(function(item){
                self.writeZip64EndOfCentralDirectory(item, writer);
                onProgress(Math.round(++count * p));
            });
            zipRecord.end_record.forEach(function(item){
                self.writeEndOfCentralDirectory(item, writer);
                onProgress(Math.round(++count * p));
            });

            return new $$.Blob([writer.buffer], { type : 'application/zip' });
        },

        readFileHeader : function(reader, zipRecord){
            var name_length, extra_length, comment_length;
            zipRecord.file_headers.push({
                version_made : reader.readBytes(2),
                version_needed : reader.readBytes(2),
                flag : reader.readBytes(2),
                compression : reader.readBytes(2),
                time : reader.readBytes(2),
                date : reader.readBytes(2),
                crc : reader.readBytes(4),
                compressed_size : reader.readBytes(4),
                uncompressed_size : reader.readBytes(4),
                name_length : (name_length= reader.readBytes(2), name_length),
                extra_length : (extra_length= reader.readBytes(2), extra_length),
                comment_length : (comment_length= reader.readBytes(2), comment_length),
                diskNumbeStart : reader.readBytes(2),
                internal_attributes : reader.readBytes(2),
                external_attributes : reader.readBytes(4),
                relative_offset : reader.readBytes(4),

                name : this.decodeAsString(reader.copyBytes(name_length).buffer),
                extra : reader.copyBytes(extra_length).buffer,
                comment : this.decodeAsString(reader.copyBytes(comment_length).buffer)
            });
        },

        writeFileHader : function(fileHeader, writer){
            writer.centralDirectorySize+= writer.writeBytes([0x02014b50, 4], [fileHeader.version_made, 2], [fileHeader.version_needed, 2],
                                                            [fileHeader.flag, 2], [fileHeader.compression, 2], [fileHeader.time, 2],
                                                            [fileHeader.date, 2], [fileHeader.crc, 4], [fileHeader.compressed_size, 4],
                                                            [fileHeader.uncompressed_size, 4], [fileHeader.name_length, 2], [fileHeader.extra_length, 2],
                                                            [fileHeader.comment_length, 2], [fileHeader.diskNumbeStart, 2], [fileHeader.internal_attributes, 2],
                                                            [fileHeader.external_attributes, 4], [fileHeader.relative_offset, 4]);
            writer.centralDirectorySize+= writer.writeBuffer(this.encodeFromString(fileHeader.name), fileHeader.extra, this.encodeFromString(fileHeader.comment));
        },

        readFile : function(reader, zipRecord){
            var uncompressed_size, compressed_size, name_length, extra_length, compression;
            zipRecord.files.push({
                version_a : reader.readBytes(2),
                flag : reader.readBytes(2),
                compression : (compression= reader.readBytes(2)),
                time : reader.readBytes(2),
                date : reader.readBytes(2),
                crc : reader.readBytes(4),
                compressed_size : (compressed_size= reader.readBytes(4)),
                uncompressed_size : (uncompressed_size= reader.readBytes(4)),
                name_length : (name_length= reader.readBytes(2)),
                extra_length : (extra_length= reader.readBytes(2)),

                name : this.decodeAsString(reader.copyBytes(name_length).buffer),
                extra : reader.copyBytes(extra_length).buffer,
                data : ((compression === 0) ? reader.copyBytes(uncompressed_size).buffer : reader.copyBytes(compressed_size).buffer)
            });
        },

        writeFile : function(file, writer){
            writer.writeBytes([0x04034b50, 4], [file.version_a, 2], [file.flag, 2],
                              [file.compression, 2], [file.time, 2], [file.date, 2],
                              [file.crc, 4], [file.compressed_size, 4], [file.uncompressed_size, 4],
                              [file.name_length, 2], [file.extra_length, 2]);
            writer.writeBuffer(this.encodeFromString(file.name), file.extra, file.data);
        },

        readExtraData : function(reader, zipRecord){
            var extra_length;
            zipRecord.extra_data.push({
                extra_length : (extra_length= reader.readBytes(4), extra_length),
                extra : reader.copyBytes(extra_length).buffer
            });
        },

        writeExtraData : function(extraData, writer){
            writer.writeBytes([0x08064b50, 4], [extraData.extra_length, 4]);
            writer.writeBuffer(extraData.extra);
        },

        readDigitalSignature : function(reader, zipRecord){
            var size;
            zipRecord.sigantures.push({
                size : (size= reader.readBytes(2), size),
                data : reader.copyBytes(size).buffer
            });
        },

        writeDigitalSignature : function(digitalSignature, writer){
            writer.writeBytes([0x05054b50, 4], [digitalSignature.size, 2]);
            writer.writeBuffer(digitalSignature.data);
        },

        readZip64EndOfCentralDirectory : function(reader, zipRecord){
            zipRecord.zip64_end_record.push({
                record_size : reader.readBytes(8),
                version_made : reader.readBytes(2),
                version_needed : reader.readBytes(2),
                disk : reader.readBytes(4),
                dir_start_disk : reader.readBytes(4),
                dir_entry_count : reader.readBytes(8),
                size_central_dir : reader.readBytes(8),
                offset : reader.readBytes(8)
            });
        },

        writeZip64EndOfCentralDirectory : function(ecd, writer){
            writer.writeBytes([0x06064b50, 4], [ecd.record_size, 8], [ecd.version_made, 2],
                              [ecd.version_needed, 2], [ecd.disk, 4], [ecd.dir_start_disk, 4],
                              [ecd.dir_entry_count, 8], [ecd.size_central_dir, 8], [ecd.offset, 8]);
        },

        readEndOfCentralDirectory : function(reader, zipRecord){
            var comment_length;
            zipRecord.end_record.push({
                disk : reader.readBytes(2),
                start_disk : reader.readBytes(2),
                entries : reader.readBytes(2),
                total_entries : reader.readBytes(2),
                size : reader.readBytes(4),
                start_offset : reader.readBytes(4),
                comment_length : (comment_length= reader.readBytes(2), comment_length),
                comment : this.decodeAsString(reader.copyBytes(comment_length).buffer)
            });
        },

        writeEndOfCentralDirectory : function(ecd, writer){
            writer.writeBytes([0x06054b50, 4], [ecd.disk, 2], [ecd.start_disk, 2],
                              [ecd.entries, 2], [ecd.total_entries, 2], [writer.centralDirectorySize , 4],
                              [ecd.start_offset, 4], [ecd.comment_length, 4]);
            writer.writeBuffer(this.encodeFromString(ecd.comment));
        },

        readSignature : function(reader){
            return reader.readBytes(4);
        },

        readNextBySignature : function(signature, reader, zipRecord){
            if(signature == 0x04034b50){
                this.readFile(reader, zipRecord);

            }else if(signature == 0x08064b50){
                this.readExtraData(reader, zipRecord);

            }else if(signature == 0x02014b50){
                this.readFileHeader(reader, zipRecord);

            }else if(signature == 0x05054b50){
                this.readDigitalSignature(reader, zipRecord);

            }else if(signature == 0x06064b50){
                this.readZip64EndOfCentralDirectory(reader, zipRecord);

            }else if(signature == 0x06054b50){
                this.readEndOfCentralDirectory(reader, zipRecord);
            }
        },

        ZipReader : function(buffer){
            this.buffer= buffer;
            this.viewer= new $$.Uint8Array(buffer);
            var cursor= -1;

            this.readBytes= function(count){
                var result= 0;
                for(var i= 0; i < count; i++){
                    cursor++;
                    result= result | ($$.parseInt($$.lib.zipper.intToHexString(this.viewer[cursor]).substr(-2), 16) << (i * 8));
                }
                return result;
            };
            this.copyBytes= function(count){
                var result= new self.Uint8Array(count);
                for(var i= 0; i < count; i++){
                    cursor++;
                    result[i]= this.viewer[cursor];
                }
                return result;
            };
            this.bytesLeft= function(){
                return cursor < this.viewer.length-1;
            };
        },

        ZipWriter : function(){
            this.buffer= new $$.ArrayBuffer(0);
            this.viewer= new $$.Uint8Array(this.buffer);
            this.centralDirectorySize= 0;

            this.writeBytes= function(d){
                var bufferLength= this.viewer.length;
                var nLength= 0;
                var cursor= 0;
                var length= null;
                var data = null;

                for(var i= 0; i < arguments.length; i++){
                    data= arguments[i];

                    if($$.Array.isArray(data)){
                        nLength+= data[1];
                    }else{
                        length= data.toString(16).length;
                        length= ((length % 2 === 0) ? length/2 : (length+1)/2);
                        nLength+= length;
                    }
                }
                bufferLength+= nLength;
                var newViewer= new $$.Uint8Array(bufferLength);

                for(i= 0; i < this.viewer.length; i++){
                    newViewer[i]= this.viewer[i];
                }

                cursor= this.viewer.length;

                for(var y= 0; y < arguments.length; y++){
                    data= arguments[y];

                    if($$.Array.isArray(data)){
                        length= data[1];
                        data= data[0];
                    }else{
                        length= data.toString(16).length;
                        length= ((length % 2 === 0) ? length/2 : (length+1)/2);
                    }

                    for(i= 0; i < length; i++){
                        newViewer[(length-i-1) + cursor]= ( data >> ((length - i - 1) * 8) );
                    }
                    cursor+= length;
                }

                this.viewer= newViewer;
                this.buffer= newViewer.buffer;
                return nLength;
            };

            this.writeBuffer= function(buffer){
                var bufferLength= this.viewer.length;
                var nLength= 0;
                var cursor= 0;

                for(i= 0; i < arguments.length; i++){
                    nLength+= (new $$.Uint8Array(arguments[i])).length;
                }
                bufferLength+= nLength;

                var newViewer= new $$.Uint8Array(bufferLength);
                for(i= 0; i < this.viewer.length; i++){
                    newViewer[i]= this.viewer[i];
                }

                cursor= this.viewer.length;

                for(var y= 0; y < arguments.length; y++){
                    var data= new Uint8Array(arguments[y]);
                    var length= data.length;

                    for(var i= 0; i < length; i++){
                        newViewer[i + cursor]= data[i];
				    }
                    cursor+= length;
                }

                this.viewer= newViewer;
                this.buffer= newViewer.buffer;
                return nLength;
            };
        },

        ZipRecord : function(){
            this.files= [];
            this.file_headers= [];
            this.extra_data= [];
            this.signatures= [];
            this.zip64_end_record= [];
            this.end_record= [];
        },

        intToHexString : function(int){
            return(int+0x10000).toString(16).substr(-4).toUpperCase();
        },

        decodeAsString : function(buffer){
            return String.fromCharCode.apply(null, new $$.Uint8Array(buffer));
        },

        encodeFromString : function(string){
            var buffer= new $$.Uint8Array(string.length);
            for(var i= 0; i < string.length; i++){
                buffer[i]= string.charCodeAt(i);
            }
            return buffer.buffer;
        }
    }
};
