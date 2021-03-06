#!/usr/bin/env node

var program   = require( "commander"       );
var pkg       = require( "../package.json" );
var jsonfile  = require( "jsonfile"        );
var fs        = require( "fs"              );
var converter = require( "../lib/index"    );

// Declare our command-line options
//
program
    .version( pkg.version )
    .usage( "[options] <file...>")
    .option( "-p, --prefix [prefix]",       "Interface prefix. Default: 'I'"                                          )
    .option( "-tp, --type-prefix [prefix]", "Type prefix. Default: 'T'"                                               )
    .option( "--enum-prefix [prefix]",      "Enum prefix. Default: 'E'"                                               )
    .option( "--enum-type [type]",          "Type of enum to generate: 'type', 'enum' or 'string-enum. Default: type" )
    .option( "-o, --out [file]",            "Output TypeScript file. Default output is to STDOUT"                     )
    .option( "-nsl, --no-string-literals",  "Don't use TypeScript 1.8 string literals for enums"                      )
    .option( "-d, --path-depth [depth]",    "The number of id/path elements to use for name resolution. Default: 1"   )
    .option( "-i, --indent [size]",         "The indent size in spaces. Default: 2"                                   )
    .option( "-v, --verbose",               "Enable debug output"                                                     )
    .option( "-e, --export",                "Generate export instead of declare statements"                           )

    .parse( process.argv );

// Check mandatory parameters
//
if ( !program.args )
{
    console.error( "ERROR: Missing input files" );
    program.help();
}

if ( program.verbose ) { console.log( "---BEGIN DEBUG---"  ); }

// Load the supplied JSON Schema files
//
var schemas = [];
program.args.forEach( function( fileName )
{
    schemas.push( jsonfile.readFileSync( fileName.trim() ) );
} );

// Run the Schema converter using the provided options
//
var typescriptCode = converter( schemas,
{
    "noStringLiterals":   program.noStringLiterals  !== undefined
,   "debug":              program.verbose           !== undefined
,   "prefix":             program.prefix            || "I"
,   "typePrefix":         program.typePrefix        || "T"
,   "enumPrefix":         program.enumPrefix        || "E"
,   "enumType":           program.enumType          || "type"
,   "pathDepth":          program.pathDepth         || 1
,   "indent":             program.indent            || 2
,   "export":             program.export
} );
if ( program.verbose ) { console.log( "---START DEBUG--" ); }

// Output the resulting TypeScript either to console or file
//
if ( program.out )
{
    fs.writeFile( program.out, typescriptCode, function( writeError )
    {
        if ( writeError ) { throw writeError; }
        console.log( "File write complete: " + program.out + "\n" );
    } );
}
else
{
    if ( program.verbose ) { console.log( "---BEGIN OUTPUT---" ); }
    console.log( typescriptCode );
    if ( program.verbose ) { console.log( "---END OUTPUT---" ); }
}
