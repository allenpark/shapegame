shapegame = open('../js/shapegame.js', 'r')
lines = shapegame.read().split('\n')
shapegame.close()
comments = []
inComment = False
currentComment = ''
afterComment = False
for line in lines:
    if inComment:
        if line == ' */':
            afterComment = True
            inComment = False
        else:
            if line[:3] != ' * ':
                print 'error with " * " formatting'
            currentComment += '</br>' + line[3:]
    elif afterComment:
        words = line.split(' ')
        descriptor = ''
        funcName = 'error with docGen.py'
        if words[0] == 'var':
            descriptor = 'constructor'
            funcName = words[1]
        else:
            protoLoc = words[0].find('.prototype')
            if (protoLoc == -1):
                descriptor = 'static'
                funcName = words[0]
            else:
                funcName = words[0].replace('.prototype', '')
        comments.append([descriptor, funcName, currentComment[5:]])
        afterComment = False
    else:
        if '/**' in line:
            if line != '/**':
                print 'Check your formatting of /**'
            currentComment = ''
            inComment = True

fout = open('doc.html', 'w')
fallout = open('docAll.html', 'w')
for commentInfo in comments:
    descriptor = commentInfo[0]
    funcName = commentInfo[1]
    comment = commentInfo[2]
    if (descriptor != ''):
        descriptor += ' '
    output = '<i>' + descriptor + '</i>'
    output += '<b>' + funcName + '</b></br>'
    output += comment + '</br></br>'

    fallout.write(output)
    if (comment.find('@public') != -1):
        fout.write(output)

fout.close()
fallout.close()
