<?php

namespace App\Repository\Line;

use App\Entity\Line;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\UuidInterface;

class GetLineById
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(UuidInterface $id): ?Line
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->select('line');
        $queryBuilder->from(Line::class,'line');
        $queryBuilder->where('line.id = :id');
        $queryBuilder->setParameter('id', $id);
        $queryBuilder->groupBy('line.id');
        $query = $queryBuilder->getQuery();
        return $query->getOneOrNullResult();
    }
}