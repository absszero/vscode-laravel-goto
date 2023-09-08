import { Place } from './Place';

/**
 * [export description]
 *
 * @param   {string}  content  [content description]
 *
 * @return  {Map<string, string>}              [return description]
 */
export function parse(content: string): Map<string, Place> {
    const middlewares = new Map();
    const classnames = collectClassNames(content);

    const aliasPattern = /\$middlewareAliases\s*=\s*\[([^;]+)/m;
    const matchBlcok = aliasPattern.exec(content);
    if (!matchBlcok) {
        return middlewares;
    }

    let match;
    const pattern = /['"]([^'"]+)['"]\s*=>\s*([^,\]]+)/g;
    while ((match = pattern.exec(matchBlcok[1])) !== null) {
        if (match.index === pattern.lastIndex) {
            pattern.lastIndex++;
        }

        match[2] = match[2].trim();
        if (match[2].endsWith('::class')) {
            match[2] = match[2].slice(0, match[2].length - '::class'.length);
        }

        let className = classnames.get(match[2]);
        if (className) {
            match[2] = className;
        }

        let place: Place = { path: match[2], location: '', uris: [] };
        middlewares.set(match[1], place);
    }

    return middlewares;
}

/**
 * collect class names
 *
 * @param   {strin}  content  [content description]
 *
 * @return  {Map<string, string>}              [return description]
 */
function collectClassNames(content: string) : Map<string, string> {
    const classnames = new Map();
    const pattern = /use\s+([^\s]+)\s+as+\s+([^;]+)/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
        if (match.index === pattern.lastIndex) {
            pattern.lastIndex++;
        }
        classnames.set(match[2], match[1].trim());
    }
    return classnames;
}