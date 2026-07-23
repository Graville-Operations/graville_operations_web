'use client';

interface TaskBasicFieldsProps {
  name: string;
  description: string;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
  descriptionRows?: number;
}

export default function TaskBasicFields({
  name,
  description,
  onChangeName,
  onChangeDescription,
  namePlaceholder = 'e.g. SubStructure Works',
  descriptionPlaceholder = 'Brief description…',
  descriptionRows = 4,
}: TaskBasicFieldsProps) {
  return (
    <>
      <div>
        <label className="gv-label">Name <span className="text-red-400">*</span></label>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder={namePlaceholder}
          className="gv-input"
        />
      </div>

      <div>
        <label className="gv-label">Description</label>
        <textarea
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder={descriptionPlaceholder}
          rows={descriptionRows}
          className="gv-input resize-none"
        />
      </div>
    </>
  );
}