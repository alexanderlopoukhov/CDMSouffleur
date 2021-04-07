import lucene

from org.apache.lucene.analysis.core import KeywordAnalyzer
from org.apache.lucene.document import Document
from org.apache.lucene.document import Field
from org.apache.lucene.document import FieldType
from org.apache.lucene.document import StringField
from org.apache.lucene.index import DirectoryReader
from org.apache.lucene.index import IndexReader
from org.apache.lucene.index import IndexWriter
from org.apache.lucene.index import IndexWriterConfig
from org.apache.lucene.index import Term
from org.apache.lucene.index import Terms
from org.apache.lucene.index import TermsEnum
from org.apache.lucene.queries.mlt import MoreLikeThis
from org.apache.lucene.queryparser.classic import ParseException
from org.apache.lucene.queryparser.classic import QueryParser
from org.apache.lucene.search import BooleanClause
from org.apache.lucene.search import BooleanQuery
from org.apache.lucene.search import IndexSearcher
from org.apache.lucene.search import Query
from org.apache.lucene.search import ScoreDoc
from org.apache.lucene.search import TermQuery
from org.apache.lucene.search import TopDocs
from org.apache.pylucene.search.similarities import PythonClassicSimilarity
from org.apache.lucene.store import Directory
from org.apache.lucene.store import SimpleFSDirectory
from org.apache.lucene.util import BytesRef
from org.apache.lucene.util import Version
from java.io import File
from java.nio.file import Paths
from cdm_souffleur.model.UsagiAnalyzer import *
import os.path
from os import path
from org.apache.lucene.analysis.standard import StandardAnalyzer


def createNewMainIndex():
    try:
        lucene.getVMEnv().attachCurrentThread()
        index_folder = 'mainIndex'
        if path.exists("mainIndex"):
            os.remove(index_folder)
        fl = File('mainIndex')
        dir = SimpleFSDirectory(Paths.get('mainIndex'))
        an = UsagiAnalyzer()
        iwc = IndexWriterConfig(an)
        iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE)
        iwc.setRAMBufferSizeMB(128.0)
        writer = IndexWriter(dir, iwc)
    except Exception as error:
        raise error