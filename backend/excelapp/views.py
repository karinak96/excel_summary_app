
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
import pandas as pd


class ExcelSummaryView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        excel_file = request.FILES.get('file')
        columns = request.data.getlist('columns')

        if not columns:
            raw_columns = request.data.get('columns', '')
            columns = [c.strip() for c in raw_columns.split(',') if c.strip()]

        if not excel_file or not columns:
            return Response({'error': 'File and columns are required'}, status=400)

        try:
            xls = pd.ExcelFile(excel_file, engine='openpyxl')
        except Exception as e:
            return Response({'error': f'Failed to read Excel file: {str(e)}'}, status=400)

        summary = []
        for sheet_name in xls.sheet_names:
            try:
                raw_df = xls.parse(sheet_name, header=None)
                header_row_index = None
                for i in range(min(20, len(raw_df))):
                    row = raw_df.iloc[i].astype(str).str.strip()
                    if any(col in row.values for col in columns):
                        header_row_index = i
                        break
                if header_row_index is None:
                    continue
                df = pd.read_excel(excel_file, sheet_name=sheet_name, header=header_row_index, engine='openpyxl')
                df.columns = df.columns.astype(str).str.strip()
                for col in columns:
                    if col in df.columns:
                        numeric_series = pd.to_numeric(df[col], errors='coerce')
                        summary.append({
                            'sheet': sheet_name,
                            'column': col,
                            'sum': round(float(numeric_series.sum(skipna=True)), 2),
                            'avg': round(float(numeric_series.mean(skipna=True)), 2)
                        })
            except Exception:
                continue

        if not summary:
            return Response({'error': 'None of the requested columns were found in any sheet'}, status=404)

        return JsonResponse({'file': excel_file.name, 'summary': summary})
