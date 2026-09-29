class ResponseParser {
  /// Safely extracts a List from diverse API response envelopes:
  /// - Direct List: [ ... ]
  /// - Standard ApiResponse: { "data": [ ... ] }
  /// - PagedDataResult: { "data": { "data": [ ... ], "pagination": { ... } } }
  /// - Alternate Paged: { "data": { "items": [ ... ] } } or { "items": [ ... ] }
  static List<dynamic> extractList(dynamic responseData) {
    if (responseData == null) return [];
    if (responseData is List) return responseData;
    if (responseData is Map<String, dynamic>) {
      final dataField = responseData['data'];
      if (dataField is List) return dataField;
      if (dataField is Map<String, dynamic>) {
        if (dataField['data'] is List) return dataField['data'] as List;
        if (dataField['items'] is List) return dataField['items'] as List;
      }
      final itemsField = responseData['items'];
      if (itemsField is List) return itemsField;
    }
    return [];
  }

  /// Safely extracts a Map from diverse API response envelopes
  static Map<String, dynamic> extractMap(dynamic responseData) {
    if (responseData == null) return {};
    if (responseData is Map<String, dynamic>) {
      final dataField = responseData['data'];
      if (dataField is Map<String, dynamic>) {
        return dataField;
      }
      return responseData;
    }
    return {};
  }
}
