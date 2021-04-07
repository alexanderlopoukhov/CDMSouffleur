import lucene
from org.apache.pylucene.analysis import PythonAnalyzer
from org.apache.lucene.util import Version
from org.apache.lucene.analysis.core import LowerCaseFilter
from org.apache.lucene.analysis.ngram import NGramTokenizer
from org.apache.lucene.analysis import Analyzer


class UsagiAnalyzer(PythonAnalyzer):
    def __init__(self):
        PythonAnalyzer.__init__(self)

    def createComponents(self, fieldName, reader):
        source = NGramTokenizer(Version.LUCENE_CURRENT, reader, 2, 3);
        result = LowerCaseFilter(Version.LUCENE_CURRENT, source);
        return Analyzer.TokenStreamComponents(source, result)

